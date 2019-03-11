<template>
    <b-navbar toggleable="lg" variant="primary">
        <b-navbar-brand>Trivialize!</b-navbar-brand>
        <b-navbar-toggle target="nav_collapse" />

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav class="ml-auto">
                <b-button variant="info" @click="$store.commit('updateInfoModalOpen',true)"><i class="far fa-question-circle"></i></b-button>
            </b-navbar-nav>
        </b-collapse>

    </b-navbar>
</template>

<script>
    export default {
        name: "TheNavbar"
    }
</script>

<style scoped>

</style>