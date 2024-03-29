import {Injectable} from '@angular/core';
import {LoggerService} from './logger.service';

export type EventHandler = (...args: any[]) => any;

@Injectable({
    providedIn: 'root',
})
export class EventsService {
    private readonly logger = LoggerService.getLogger(EventsService.name);

    private eventMap = new Map<string, EventHandler[]>();

    /**
     * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
     *
     * @param topic the topic to subscribe to
     * @param handlers the event handlers
     */
    subscribe(topic: any, ...handlers: EventHandler[]) {
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
    unsubscribe(topic: string, handler?: EventHandler): boolean {
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
    publish(topic: string, ...eventData: any[]): any[] | null {
        const topics = this.eventMap.get(topic);
        if (!topics) {
            return null;
        }

        return topics.map(handler => {
            try {
                return handler(...eventData);
            } catch (e) {
                this.logger.error({message: 'publish error', error: e});
                return null;
            }
        });
    }
}
