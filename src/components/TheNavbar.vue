<template>
    <div style="z-index: 1;">
        <b-navbar toggleable="md" class="vignette nav-border" variant="primary">
            <b-navbar-brand style="font-family: 'Pacifico', cursive;" class="d-flex">
                <b-img :src="require('@/assets/images/Trivialize_Logo.png')" fluid style="width: 3rem; height: 3rem;" />
                <h3 class="navbar-text mx-2">Trivialize!</h3>
            </b-navbar-brand>

            <b-navbar-toggle target="nav_collapse" />

            <b-collapse is-nav id="nav_collapse">
                <b-navbar-nav class="ml-auto">
                    <b-button class="m-1" variant="info" @click="$store.commit('updateInfoModalOpen',true)"><i class="far fa-question-circle"></i></b-button>
                    <b-button class="m-1" variant="secondary" v-b-modal.TheSettingsModal><i class="fas fa-cog"></i></b-button>
                </b-navbar-nav>
            </b-collapse>

        </b-navbar>

        <TheSettingsModal></TheSettingsModal>
        <TheInfoModal></TheInfoModal>
    </div>
</template>

<script>
    import 'vue-slider-component/theme/antd.css';
    import TheSettingsModal from "@/components/TheNavbar/TheSettingsModal";
    import TheInfoModal from "@/components/TheInfoModal";

    export default {
        name: "TheNavbar",
        components: {
            TheInfoModal,
            TheSettingsModal,
        }
    }
</script>

<style scoped>
    .vignette{
        box-shadow: inset 0 0 20px black;
    }
    .nav-border {
        border-radius: 0 0 0 15px;
    }
    .navbar-text{
        color: black !important;
    }
</style>