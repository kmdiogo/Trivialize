<template>
    <div id="app" class="h-100 d-flex flex-column">
        <TheNavbar class="flex-shrink-0 the-navbar"></TheNavbar>
        <router-view class="flex-grow-1" />
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

        /*background-image: url('assets/images/Beatles_Wallpaper.jpg');
        -webkit-animation:100s scroll infinite linear;
        -moz-animation:100s scroll infinite linear;
        -o-animation:100s scroll infinite linear;
        -ms-animation:100s scroll infinite linear;
        animation:100s scroll infinite linear;*/
    }
    .the-navbar {
        position: absolute;
        right: 0;
        top: 0;
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
    @-webkit-keyframes scroll{
        100%{
            background-position:0px -3000px;
        }
    }
    @-moz-keyframes scroll{
        100%{
            background-position:0px -3000px;
        }
    }
    @-o-keyframes scroll{
        100%{
            background-position:0px -3000px;
        }
    }
    @-ms-keyframes scroll{
        100%{
            background-position:0px -3000px;
        }
    }
    @keyframes scroll{
        100%{
            background-position:0px -3000px;
        }
    }
</style>
