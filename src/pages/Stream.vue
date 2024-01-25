<template>
    <div class="container d-flex flex-column py-3">
        <div class="d-flex flex-fill justify-content-start align-items-center mb-2">
            <img src="/favicon.svg" class="logo">
            <router-link to="/" class="title">
                <h1 class="mb-0">Streams</h1>
            </router-link>
        </div>
        <video id="player" class="video-js vjs-live" controls></video>
        <div class="stream-container">
            <div class="d-flex flex-column overflow-scroll">
                <label>Stream</label>
                <span>{{ stream }}</span>
            </div>
            <button class="button" @click="copyUrl">Copy URL</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import videojs from 'video.js'
import { store } from '/js/store.js'

const router = useRouter();
const stream = ref(null);

async function copyUrl() {
    await navigator.clipboard.writeText(stream.value);
}

onMounted(() => {
    // Check for the id
    if (!router.currentRoute.value.params.id) {
        router.push("/")
        return;
    }
    stream.value = atob(router.currentRoute.value.params.id);

    if (store.player) {
        store.player.dispose();
    }

    // Create the player
    store.player = videojs('player', {
        autoplay: true,
        controls: true,
        liveui: true,
        sources: [{
            src: stream.value,
            type: 'application/x-mpegURL'
        }]
    })
})

</script>