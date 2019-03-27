<template>
    <div id="app" class="h-100 d-flex flex-column">
        <TheNavbar class="flex-shrink-0 tabBar"></TheNavbar>
        <router-view />
    </div>
</template>


<script>
    import TheNavbar from "@/components/TheNavbar";

    export default {
        components: {TheNavbar},
    }
</script>

<style lang="scss">
    @import 'assets/styles/main';
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
    #nav {
        padding: 30px;
        a {
            font-weight: bold;
            color: #2c3e50;
            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }
    .settings-box {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
    .tabBar{
        margin-left: 1600px;
    }
</style>
