/* EVENT EMITTERS: Exports functions that dispatches instance based custom event that're emitted/listened throughout the app. */

/* ********************************************* EMITTER CLASS INSTANCE *********************************************

    Executing emitter creates new emitter class instances that're used separately for different modules.
*/

const emitter = () => {
    // Store event listeners. Ex: { 'trackchange': [callback1, callback2] }
    const _listeners = {};

    class EventEmitter {
        // PUBLISH
        emit(event, data = undefined) {
            _listeners[event]?.forEach(cb => cb(data));
        }

        // SUBSCRIBE
        on(event, callback) {
            if (!_listeners[event]) _listeners[event] = []; // Create new event if absent
            if (callback) _listeners[event].push(callback); // Push callback if present
        }

        // UNSUBSCRIBE
        off(event, callback) {
            if (!_listeners[event]) return;                                      // Return in absence of event
            _listeners[event] = _listeners[event].filter(cb => cb !== callback); // Remove passed callback
            if (_listeners[event].length === 0) delete _listeners[event];        // Optional cleanup
        }
    }
    return new EventEmitter();
}

/* ********************************************* EXPORT EVENT EMITTERS *********************************************

    > Export EventEmitter class instances
    # SONG: pass CONT_ID, IDX with its events
    # NAV: window history push + set show id
*/

export const SONG = emitter();
export const NAV = emitter();