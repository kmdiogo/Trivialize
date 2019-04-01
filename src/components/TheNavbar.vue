<template>
    <div style="z-index: 1;">
        <b-navbar toggleable="md" class="vignette nav-border d-none d-md-flex" variant="white">
            <b-navbar-brand style="font-family: 'Pacifico', cursive;" class="d-flex">
                <b-img :src="require('@/assets/images/Trivialize_Logo_Color.png')" fluid style="width: 3rem; height: 3rem;" />
                <h3 class="navbar-text mx-2">Trivialize!</h3>
            </b-navbar-brand>

            <b-navbar-nav class="ml-auto">
                <b-button class="m-1" variant="primary" @click="$store.commit('updateInfoModalOpen',true)"><i class="far fa-question-circle"></i></b-button>
                <b-button class="m-1" variant="secondary" v-b-modal.TheSettingsModal><i class="fas fa-cog"></i></b-button>
            </b-navbar-nav>
        </b-navbar>
        <div class="d-md-none">
            <div class="d-flex justify-content-end">
                <b-button class="m-1" variant="primary" @click="$store.commit('updateInfoModalOpen',true)"><i class="far fa-question-circle"></i></b-button>
                <b-button class="m-1" variant="secondary" v-b-modal.TheSettingsModal><i class="fas fa-cog"></i></b-button>
            </div>
            <b-img :src="require('@/assets/images/Trivialize_Logo_Color.png')" fluid style="width: 3rem; height: 3rem; position: fixed; top: 5px; left: 5px;" />
        </div>

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