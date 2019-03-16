<template>
    <div id="app" class="h-100 d-flex flex-column">
        <TheNavbar class="flex-shrink-0"></TheNavbar>
        <!--<SettingsBox class="settings-box"></SettingsBox>-->
        <router-view class="flex-grow-1" />
    </div>
</template>


<script>
    import TheNavbar from "@/components/TheNavbar";

    export default {
        components: {TheNavbar},
        created() {
            if (window.location.hash) {
                this.getTokenFromURL();
            }
        },
        methods: {
            getTokenFromURL() {
                let hash = window.location.hash.substring(1);
                let token = hash.split('=')[1];
                this.$store.commit('updateAccessToken', token);
            }
        }
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
</style>
