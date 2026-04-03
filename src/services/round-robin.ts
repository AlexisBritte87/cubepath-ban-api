import type { ChatProvider } from "../chat/provider.ts";

export class RoundRobinProviders {
  private providers: ChatProvider[] = [];
  private currentIndex: number = 0;

  constructor(providers: (ChatProvider | null)[]) {
    this.providers = providers.filter((p): p is ChatProvider => p !== null);
  }

  get length(): number {
    return this.providers.length;
  }

  get activeNames(): string[] {
    return this.providers.map(p => p.name);
  }

  getNext(): ChatProvider | null {
    if (this.providers.length === 0) return null;
    const provider = this.providers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.providers.length;
    return provider ?? null;
  }

  getProviderByName(name: string): ChatProvider | null {
    return this.providers.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }
}
