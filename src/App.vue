<template>
    <div id="app" class="h-100 d-flex flex-column">
        <div class="overlay">
            <TheNavbar class="flex-shrink-0 tabBar"></TheNavbar>
            <router-view />
        </div>
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

    .overlay{
        position:fixed;
        background: url(https://cdn.wallpapersafari.com/71/83/lgzfcB.jpg);
                //url(https://cdn.wallpapersafari.com/67/93/b4lhpN.jpg);
        -webkit-animation:100s scroll infinite linear;
        -moz-animation:100s scroll infinite linear;
        -o-animation:100s scroll infinite linear;
        -ms-animation:100s scroll infinite linear;
        animation:100s scroll infinite linear;
        top:0;
        left:0;
        width:100%;
        height:100%;
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
