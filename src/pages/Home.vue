<template>
    <div class="container d-flex flex-column py-3">
        <div class="d-flex flex-fill justify-content-start mb-2">
            <router-link to="/">
                <h1 class="fw-bold">IPTV Streams</h1>
            </router-link>
        </div>
        <div class="input-group">
            <input ref="search_input" v-model="query" type="text" class="form-control" placeholder="Search for streams"
                aria-label="Search for streams" @input="typing" :disabled="!streams_loaded">
        </div>
        <ul class="list-group mt-3">
            <li v-for="result in results" class="list-group-item list-group-item-action clickable"
                @click="open_stream(result)">
                <div class="d-flex flex-column">
                    <div class="d-flex flex-row justify-content-between">
                        <span class="fw-bold">{{ result.item.channel }}</span>
                    </div>
                    <small>{{ result.item.url }}</small>
                </div>
            </li>
        </ul>
        <div class="footer">
            <p>All streams are taken from <a href="https://github.com/iptv-org/iptv">iptv-org/iptv</a></p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import { store } from '/js/store.js'

const router = useRouter();

const streams = ref([]);

const fuse = ref(null);
const query = ref('');
const results = ref([]);
const streams_loaded = ref(false);
const search_input = ref(null);

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
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const typing = debounce(async (event) => {
    event.preventDefault();
    if (!query.value.length) {
        results.value = [];
        return;
    }
    get_results();
});


async function get_results() {
    if (!query.value.length) {
        results.value = [];
        return;
    }
    results.value = fuse.value.search(query.value);
}

async function open_stream(result) {
    router.push("/stream/" + btoa(result.item.url));
}

onMounted(() => {
    fuse.value = new Fuse(streams.value, {
        keys: ['channel', 'url'],
        threshold: 0.3,
    })

    get_streams();
})
</script>