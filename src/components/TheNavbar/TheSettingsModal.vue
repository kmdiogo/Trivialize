<template>
    <b-modal id="TheSettingsModal" title="Settings" centered ok-only>
        <p v-if="$store.state.lockControls" class="text-danger">*Please wait for playback to finish before changing settings</p>
        <b-card>
            <b-form-group label="Listening Duration (seconds)">
                <VueSlider :min="5" :max="20" v-model="listeningDuration" :disabled="$store.state.lockControls"></VueSlider>
            </b-form-group>
            <b-form-group label="Number of Choices">
                <VueSlider :min="2" :max="10" v-model="numberOfChoices" :disabled="$store.state.lockControls"></VueSlider>
            </b-form-group>
        </b-card>
    </b-modal>
</template>

<script>
    import VueSlider from 'vue-slider-component'
    import 'vue-slider-component/theme/default.css'
    export default {
        name: "TheSettingsModal",
        computed: {
            numberOfChoices: {
                get() {return this.$store.state.settings.numberOfChoices;},
                set(value) {this.$store.commit('updateNumberOfChoices', value)}
            },
            listeningDuration: {
                get() {return Math.floor(this.$store.state.settings.listeningDuration/1000)},
                set(value) {this.$store.commit('updateListeningDuration', value*1000)}
            }
        },
        components: {
            VueSlider
        }
    }
</script>

<style scoped>

</style>