export class ExFSM {
  public states = new Map<string, ExState>();
  public current: ExState | null = null;
  public currentParams: any[] = [];
  public currentTime: number = 0;

  constructor() {}

  register(...types: (string | ExState)[]): ExState[] {
    let generatedStates: ExState[] = [];

    for (const state of types) {
      if (typeof state === "string") {
        const newstate = new ExState(state, this);
        generatedStates.push(newstate);
        this.states.set(newstate.name, newstate);
        continue;
      }
      // state is a ExState

      const newState = state;
      generatedStates.push(newState);
      this.states.set(newState.name, newState);
    }

    return generatedStates;
  }

  set(state: string | ExState, ...params: any[]): void | Promise<void> {
    let entering: void | Promise<void>;
    let leaving: void | Promise<void> | null;
    let next: ExState;

    // use the string to create a new state
    if (typeof state === "string") {
      const newstate = this.states.get(state);
      if (!newstate) {
        throw new Error(`State ${state} not found`);
      }

      next = newstate;
    } else {
      const newstate = this.states.get(state.name);
      if (!newstate) {
        throw new Error(`State ${state} not found`);
      }

      next = newstate;
    }

    if (this.current) {
      leaving = this.current.exit(next, ...params);
    } else {
      leaving = null;
    }

    // add the async code for the current state leaving
    if (leaving instanceof Promise) {
      return leaving.then(() => {
        entering = next.enter(this.current, ...params);
        if (entering instanceof Promise) {
          return entering.then(() => {
            this.current = next;
            this.currentParams = params;
            this.currentTime = Date.now();
          });
        }
        this.current = next;
        this.currentParams = params;
        this.currentTime = Date.now();
      });
    }

    entering = next.enter(this.current, ...params);

    if (entering instanceof Promise) {
      return entering.then(() => {
        this.current = next;
        this.currentParams = params;
        this.currentTime = Date.now();
      });
    }
    this.current = next;
    this.currentParams = params;
    this.currentTime = Date.now();
  }

  has(state: string | ExState): boolean {
    if (typeof state === "string") {
      return this.states.has(state);
    }
    return this.states.has(state.name);
  }

  get(): ExState {
    if (!this.current) {
      throw new Error("No state set");
    }
    return this.current;
  }

  reset() {
    this.current = null;
    this.currentParams = [];
    this.currentTime = 0;
  }

  update() {
    if (!this.current) {
      return;
    }
    if (this.current) {
      this.current.update(...this.currentParams);
    }
  }
}

export class ExState {
  constructor(public name: string, public machine: ExFSM) {}

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {}

  exit(_next: ExState | null, ...params: any): void | Promise<void> {}

  update(...params: any): void | Promise<void> {}

  repeat(...params: any): void | Promise<void> {}
}
