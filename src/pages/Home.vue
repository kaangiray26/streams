<template>
    <div class="container d-flex flex-column py-3">
        <div class="d-flex flex-fill justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
                <img src="/favicon.svg" class="logo">
                <router-link to="/" class="title">
                    <h1 class="mb-0">Streams</h1>
                </router-link>
            </div>
            <div class="toolbar d-flex" @click="open_options">
                <img src="/add.svg" class="img-btn">
            </div>
        </div>
        <div class="d-flex flex-fill search-bar">
            <div class="input-group">
                <input ref="search_input" v-model="query" type="text" class="flex-fill" placeholder="Search for streams"
                    aria-label="Search for streams" @input="typing" :disabled="!streams_loaded">
            </div>
            <div class="spinner-container">
                <span v-show="loading" class="spinner-border text-dark" role="status">
                </span>
            </div>
        </div>
        <ul class="list-group mt-2">
            <li v-for="(result, index) in results"
                class="d-flex justify-content-between list-group-item list-group-item-action clickable"
                @click="open_stream(result)">
                <div class="d-flex flex-column overflow-auto">
                    <div class="d-flex flex-row justify-content-between">
                        <span class="fw-bold">{{ result.item.channel }}</span>
                    </div>
                    <small class="text-nowrap">{{ result.item.url }}</small>
                </div>
                <span v-show="index < 10" class="bi bi-circle-fill temporary-danger"
                    :class="{ 'text-success': available.includes(result.refIndex) }"></span>
            </li>
        </ul>
        <div class="footer text-light">
            <p>All streams are taken from <a href="https://github.com/iptv-org/iptv">iptv-org/iptv</a></p>
        </div>
    </div>
    <div v-if="options_visible" class="options-container">
        <div class="container">
            <div class="options">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold mb-0">Open stream</h5>
                    <button class="btn-close" @click="options_visible = false"></button>
                </div>
                <div class="input-group">
                    <input ref="options_input" v-model="options_stream" type="text" class="form-control"
                        placeholder="https://example.com/stream.m3u8" aria-label="Search for streams"
                        @keypress.enter="open_custom_stream">
                    <button class="btn btn-dark" @click="open_custom_stream"
                        :disabled="!options_stream.length">Open</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'

const router = useRouter();

const streams = ref([]);

const options_visible = ref(false);
const options_stream = ref('');
const options_input = ref(null);

const fuse = ref(null);
const query = ref('');
const results = ref([]);
const streams_loaded = ref(false);
const search_input = ref(null);
const loading = ref(false);

const available = ref([]);

async function get_streams() {
    fetch('https://iptv-org.github.io/api/streams.json')
        .then(res => res.json())
        .then(async (data) => {
            streams.value = data
            fuse.value.setCollection(streams.value)
            streams_loaded.value = true;
            await nextTick();
            search_input.value.focus();
        })
}

function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        loading.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const typing = debounce(async (event) => {
    event.preventDefault();
    if (!query.value.length) {
        results.value = [];
        loading.value = false;
        return;
    }
    get_results();
});


async function get_results() {
    if (!query.value.length) {
        results.value = [];
        loading.value = false;
        return;
    }

    // Search for matching streams
    results.value = fuse.value.search(query.value);

    // Check top 10 results for availability
    results.value.slice(0, 10).map(result => {
        fetch(result.item.url, {
            method: 'HEAD',
        })
            .then(res => {
                if (res.ok) {
                    available.value.push(result.refIndex);
                }
            })
    })

    loading.value = false;
}

async function open_custom_stream() {
    router.push("/stream/" + btoa(options_stream.value));
}

async function open_stream(result) {
    router.push("/stream/" + btoa(result.item.url));
}

async function open_options() {
    options_visible.value = true;
    await nextTick();
    options_input.value.focus();
}

async function handle_keydown(event) {
    if (options_visible.value && event.key === 'Escape') {
        options_visible.value = false;
        return
    }

    // Ctrl+K for search
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        search_input.value.focus();
        return;
    }
}

onBeforeMount(() => {
    get_streams();
    fuse.value = new Fuse(streams.value, {
        keys: ['channel', 'url'],
        threshold: 0.3,
    })
    // Add keyboard shortcuts
    document.addEventListener('keydown', handle_keydown);
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handle_keydown);
})
</script>