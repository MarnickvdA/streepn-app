import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let EventsService = class EventsService {
    constructor() {
        this.eventMap = new Map();
    }
    /**
     * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
     *
     * @param topic the topic to subscribe to
     * @param handlers the event handlers
     */
    subscribe(topic, ...handlers) {
        let topics = this.eventMap.get(topic);
        if (!topics) {
            this.eventMap.set(topic, topics = []);
        }
        topics.push(...handlers);
    }
    /**
     * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
     *
     * @param topic the topic to unsubscribe from
     * @param handler the event handler
     *
     * @return true if a handler was removed
     */
    unsubscribe(topic, handler) {
        if (!handler) {
            return this.eventMap.delete(topic);
        }
        const topics = this.eventMap.get(topic);
        if (!topics) {
            return false;
        }
        // We need to find and remove a specific handler
        const index = topics.indexOf(handler);
        if (index < 0) {
            // Wasn't found, wasn't removed
            return false;
        }
        topics.splice(index, 1);
        if (topics.length === 0) {
            this.eventMap.delete(topic);
        }
        return true;
    }
    /**
     * Publish an event to the given topic.
     *
     * @param topic the topic to publish to
     * @param eventData the data to send as the event
     */
    publish(topic, ...eventData) {
        const topics = this.eventMap.get(topic);
        if (!topics) {
            return null;
        }
        return topics.map(handler => {
            try {
                return handler(...eventData);
            }
            catch (e) {
                console.error(e);
                return null;
            }
        });
    }
};
EventsService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], EventsService);
export { EventsService };
//# sourceMappingURL=events.service.js.map