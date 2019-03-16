<template>
    <b-navbar toggleable="md" variant="primary">
        <b-navbar-brand>Trivialize!</b-navbar-brand>

        <b-navbar-toggle target="nav_collapse" />

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav class="ml-auto">
                <b-button class="mr-1" variant="info" @click="$store.commit('updateInfoModalOpen',true)"><i class="far fa-question-circle"></i></b-button>
                <b-button class="ml-1" variant="secondary" v-b-modal.TheSettingsModal><i class="fas fa-cog"></i></b-button>
            </b-navbar-nav>
        </b-collapse>

        <TheSettingsModal></TheSettingsModal>
        <TheInfoModal></TheInfoModal>
    </b-navbar>
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

</style>