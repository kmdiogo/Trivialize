<template>
    <div class="d-flex flex-column justify-content-center align-items-center h-100 p-2">
        <b-img :src="require('@/assets/images/sad_note.png')" fluid></b-img>
        <h2>Whoops! Something went wrong!</h2>
        <h3>Please contact the creator at kenneth.diogo@gmail.com</h3>
    </div>
</template>

<script>
    export default {
        name: "Error.vue"
    }
</script>

<style scoped>

</style>