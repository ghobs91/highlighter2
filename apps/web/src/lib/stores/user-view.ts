import { ndk } from "@kind0/ui-common";
import { NDKKind, NDKEvent, type NDKUser, type NostrEvent } from "@nostr-dev-kit/ndk";
import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { writable, get as getStore, derived } from "svelte/store";

let activeUserView: NDKUser | undefined;

export let userSubscription: NDKEventStore<NDKEvent> = undefined;
export const userHighlights = writable(new Set<NDKEvent>);

export function startUserView(user: NDKUser) {
    const $ndk = getStore(ndk);

    if (userSubscription) {
        userSubscription.unsubscribe();
    }

    activeUserView = user;

    userSubscription = $ndk.storeSubscribe([
        // highlights and articles the user has created
        {
            kinds: [ NDKKind.Highlight, NDKKind.Article ],
            authors: [user.pubkey]
        },
        // supporting options
        {
            kinds: [ 7002 as number ],
            authors: [ user.pubkey ],
        },
        // supporters
        {
            kinds: [ 7001 as number ],
            "#p": [ user.pubkey ],
        },
        // zaps the user has received
        {
            kinds: [ NDKKind.Zap ],
            "#p": [ user.pubkey ]
        }
    ], {
        subId: 'user-view'
    });
}

export function getUserSupportPlansStore() {
    return derived(userSubscription, ($userSubscription) => {
        if (!$userSubscription || !activeUserView) return [];

        const plans = $userSubscription.filter((event) => {
            return event.kind === 7002;
        });

        return plans;
    });
}

export function getUserSupporters() {
    return derived(userSubscription, ($userSubscription) => {
        if (!$userSubscription || !activeUserView) return [];

        const supporters = $userSubscription.filter((event) => {
            return event.kind === 7001;// && event.tagValue("p") === activeUserView?.pubkey;
        });

        return supporters;
    });
}