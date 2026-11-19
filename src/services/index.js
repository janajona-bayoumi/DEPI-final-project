// ============================================================
// index.js — the ONLY entry point components import from:
//     import { getDoctors, bookSlot, subscribe } from '../services'
//
// To switch to the real backend later:
//   1) change the first line to:  export * from './httpApi'
//   2) remove the `subscribe` line below and export `subscribe` from httpApi.js
//      instead (polling or websocket, same callback signature).
// ============================================================
export * from "./mockApi";
export * from "./models";
export { subscribe } from "./storage";
