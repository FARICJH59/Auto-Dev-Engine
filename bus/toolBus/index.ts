/**
 * Tool Bus Service
 * Phase-2 - Plugin registry and capability negotiation scaffold
 */

/**
 * Tool capability definition
 */
export interface ToolCapability {
  /** Capability identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this capability does */
  description: string;
  /** Input schema (JSON Schema format) */
  inputSchema?: Record<string, unknown>;
  /** Output schema (JSON Schema format) */
  outputSchema?: Record<string, unknown>;
}

/**
 * Tool plugin definition
 */
export interface ToolPlugin {
  /** Unique plugin identifier */
  id: string;
  /** Human-readable plugin name */
  name: string;
  /** Plugin version (semver) */
  version: string;
  /** Plugin description */
  description: string;
  /** Capabilities provided by this plugin */
  capabilities: ToolCapability[];
  /** Plugin entry point */
  entryPoint: string;
  /** Is this plugin currently active */
  active: boolean;
  /** Plugin metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  /** Target capability ID */
  capabilityId: string;
  /** Input data for the tool */
  input: unknown;
  /** Execution context */
  context?: Record<string, unknown>;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Output data from the tool */
  output?: unknown;
  /** Error message if failed */
  error?: string;
  /** Plugin that handled the request */
  pluginId: string;
  /** Execution duration in milliseconds */
  durationMs: number;
}

/**
 * Capability negotiation request
 */
export interface NegotiationRequest {
  /** Required capabilities */
  requiredCapabilities: string[];
  /** Preferred capabilities (nice to have) */
  preferredCapabilities?: string[];
  /** Minimum plugin version requirements */
  minVersions?: Record<string, string>;
}

/**
 * Capability negotiation result
 */
export interface NegotiationResult {
  /** Whether negotiation was successful */
  success: boolean;
  /** Plugins that satisfy the requirements */
  matchedPlugins: ToolPlugin[];
  /** Missing required capabilities */
  missingCapabilities: string[];
  /** Available preferred capabilities */
  availablePreferred: string[];
}

/**
 * Tool Bus configuration
 */
export interface ToolBusConfig {
  /** Plugin cache directory */
  pluginCachePath: string;
  /** Default execution timeout in ms */
  defaultTimeoutMs: number;
  /** Enable plugin hot-reload */
  hotReloadEnabled: boolean;
}

/**
 * Interface for Tool Bus operations
 */
export interface IToolBus {
  /** Register a new plugin */
  registerPlugin(plugin: ToolPlugin): void;
  /** Unregister a plugin */
  unregisterPlugin(id: string): boolean;
  /** Get all registered plugins */
  getPlugins(): ToolPlugin[];
  /** Get a specific plugin by ID */
  getPlugin(id: string): ToolPlugin | undefined;
  /** Negotiate capabilities */
  negotiate(request: NegotiationRequest): NegotiationResult;
  /** Find plugins by capability */
  findByCapability(capabilityId: string): ToolPlugin[];
  /** Execute a tool */
  execute(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
  /** Health check */
  healthCheck(): { healthy: boolean; message: string };
}

/**
 * Tool Bus implementation
 * Plugin registry and capability negotiation scaffold
 */
export class ToolBus implements IToolBus {
  private config: ToolBusConfig;
  private plugins: Map<string, ToolPlugin> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map(); // capability -> plugin IDs

  constructor(config?: Partial<ToolBusConfig>) {
    this.config = {
      pluginCachePath: './bus/toolBus/.plugins-cache',
      defaultTimeoutMs: 30000,
      hotReloadEnabled: false,
      ...config
    };
  }

  /**
   * Register a new plugin
   */
  registerPlugin(plugin: ToolPlugin): void {
    this.plugins.set(plugin.id, plugin);

    // Index capabilities
    for (const capability of plugin.capabilities) {
      if (!this.capabilityIndex.has(capability.id)) {
        this.capabilityIndex.set(capability.id, new Set());
      }
      this.capabilityIndex.get(capability.id)!.add(plugin.id);
    }

    console.log(`[ToolBus] Registered plugin: ${plugin.name} v${plugin.version}`);
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      return false;
    }

    // Remove from capability index
    for (const capability of plugin.capabilities) {
      const pluginIds = this.capabilityIndex.get(capability.id);
      if (pluginIds) {
        pluginIds.delete(id);
        if (pluginIds.size === 0) {
          this.capabilityIndex.delete(capability.id);
        }
      }
    }

    this.plugins.delete(id);
    console.log(`[ToolBus] Unregistered plugin: ${plugin.name}`);
    return true;
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): ToolPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(id: string): ToolPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Negotiate capabilities
   */
  negotiate(request: NegotiationRequest): NegotiationResult {
    const missingCapabilities: string[] = [];
    const matchedPluginIds = new Set<string>();

    // Check required capabilities
    for (const required of request.requiredCapabilities) {
      const pluginIds = this.capabilityIndex.get(required);
      if (!pluginIds || pluginIds.size === 0) {
        missingCapabilities.push(required);
      } else {
        for (const id of pluginIds) {
          matchedPluginIds.add(id);
        }
      }
    }

    // Check preferred capabilities
    const availablePreferred: string[] = [];
    for (const preferred of request.preferredCapabilities || []) {
      if (this.capabilityIndex.has(preferred)) {
        availablePreferred.push(preferred);
      }
    }

    // Get matched plugins
    let matchedPlugins = Array.from(matchedPluginIds)
      .map(id => this.plugins.get(id)!)
      .filter(plugin => plugin.active);

    // Filter by version requirements if specified
    if (request.minVersions) {
      matchedPlugins = matchedPlugins.filter(plugin => {
        const minVersion = request.minVersions![plugin.id];
        if (!minVersion) return true;
        return this.compareVersions(plugin.version, minVersion) >= 0;
      });
    }

    return {
      success: missingCapabilities.length === 0,
      matchedPlugins,
      missingCapabilities,
      availablePreferred
    };
  }

  /**
   * Simple semver comparison (major.minor.patch)
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const diff = (partsA[i] || 0) - (partsB[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  /**
   * Find plugins by capability
   */
  findByCapability(capabilityId: string): ToolPlugin[] {
    const pluginIds = this.capabilityIndex.get(capabilityId);
    if (!pluginIds) {
      return [];
    }
    return Array.from(pluginIds)
      .map(id => this.plugins.get(id)!)
      .filter(plugin => plugin.active);
  }

  /**
   * Execute a tool
   * Note: This is a scaffold implementation that simulates execution
   */
  async execute(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const timeout = request.timeoutMs || this.config.defaultTimeoutMs;

    // Find a plugin that provides the capability
    const plugins = this.findByCapability(request.capabilityId);

    if (plugins.length === 0) {
      return {
        success: false,
        error: `No plugin found for capability: ${request.capabilityId}`,
        pluginId: '',
        durationMs: Date.now() - startTime
      };
    }

    const plugin = plugins[0]; // Use first matching plugin

    // Scaffold: Simulate execution
    // In a real implementation, this would load and invoke the plugin
    try {
      // Simulate async execution
      await new Promise(resolve => setTimeout(resolve, 10));

      return {
        success: true,
        output: {
          message: `Tool executed successfully via ${plugin.name}`,
          capabilityId: request.capabilityId,
          input: request.input
        },
        pluginId: plugin.id,
        durationMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        pluginId: plugin.id,
        durationMs: Date.now() - startTime
      };
    }
  }

  /**
   * Health check
   */
  healthCheck(): { healthy: boolean; message: string } {
    const activePlugins = Array.from(this.plugins.values()).filter(p => p.active);
    const totalCapabilities = this.capabilityIndex.size;

    return {
      healthy: true,
      message: `ToolBus: ${activePlugins.length} active plugins, ${totalCapabilities} capabilities registered`
    };
  }

  /**
   * Get statistics
   */
  getStats(): { plugins: number; activePlugins: number; capabilities: number } {
    const activePlugins = Array.from(this.plugins.values()).filter(p => p.active).length;
    return {
      plugins: this.plugins.size,
      activePlugins,
      capabilities: this.capabilityIndex.size
    };
  }
}

// Default export: create a new instance with default configuration
export default new ToolBus();
