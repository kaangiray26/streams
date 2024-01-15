import { createRouter, createWebHistory } from 'vue-router';
import Home from '/pages/Home.vue';
import Stream from '/pages/Stream.vue';

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/stream/:id(.*)",
        component: Stream
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router