import { DomListener } from "./DomListener";
import { Dom } from "./dom";
import { Type } from "../components/app/App";
import { Emmiter, AppEvents } from "./Emitter";
import { AppAction, Store } from "./Store";
import { createStore } from "./createStore";

export interface AppComponentOptions {
  name?: string;
  listeners: (keyof HTMLElementEventMap)[];
  emmiter: Emmiter;
  store: Store;
}

export abstract class AppComponent extends DomListener {
  static className: string = "";
  private readonly emitter: Emmiter;
  private readonly unsubscribers: Function[] = [];
  protected readonly store: Store;
  private storeSubscribtion: ReturnType<Store["subscribe"]>;

  public constructor($root: Dom, options: AppComponentOptions) {
    super($root, options.listeners || []);
    this.name = options.name || this.constructor.prototype.constructor.name;
    this.prepare();
    this.emitter = options.emmiter;
    this.store = options.store;
  }

  protected prepare() {}

  public toHTML(): string {
    throw new Error("Not implemented");
  }

  public emit(event: AppEvents, ...rest) {
    this.emitter.emit(event, ...rest);
  }

  public on(event: AppEvents, cb: Function) {
    this.unsubscribers.push(this.emitter.subscribe(event, cb));
  }

  public unsubscribeAll() {
    this.unsubscribers.forEach(unsubFn => unsubFn());
  }

  public dispatch(action: AppAction): void {
    this.store.dispatch(action);
  }

  public subscribe(
    fn: Parameters<ReturnType<typeof createStore>["subscribe"]>[0]
  ): void {
    this.storeSubscribtion = this.store.subscribe(fn);
  }

  public init() {
    this.initDOMListeners();
  }

  public destroy() {
    this.removeDOMListeners();
    this.unsubscribeAll();
    this.storeSubscribtion.unsubscribe();
  }
}
