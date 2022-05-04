<template>
    <div class="home">
        <div class="titre-logo">
            <img class="logo" src="../assets/logo.png" alt="" />
            <div class="titre">CRITWI</div>
        </div>
        <div class="body">
            <div :class="{ 'non-detail': !detail }" class="gauche">
                <div class="titre">Machine</div>
                <machine></machine>
            </div>
            <div class="droite" v-if="detail">
                <div class="titre">Detail</div>
                <detail></detail>
            </div>
        </div>
    </div>
</template>

<script>
import machine from "@/components/machine.vue"
import detail from "@/components/detail.vue"
export default {
    components: { machine, detail },
    data() {
        return { detail: true }
    },
}
</script>
<style lang="scss">
* {
    color: white;
}
html,
body,
#app {
    overflow: hidden;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
}
.home {
    height: 100%;
    width: 100%;
    background-color: #1e1e1e;

    .titre-logo {
        margin-left: 20px;
        width: 100%;
        height: 12vh;
        text-align: center;
        justify-content: center;
        .logo {
            width: 90px;
            height: 90px;
            margin: 10px;
        }
        .titre {
            margin-top: -34px;
            font-weight: 800;
            font-size: 18px;
        }
    }
    .body {
        display: inline-flex;
        width: 100%;
        height: 85vh;
        .titre {
            margin: 10px;
            font-weight: 700;
            font-size: 18px;
        }
        .gauche,
        .droite {
            margin: 10px;
        }
        .gauche {
            border: 1px solid rgb(109, 109, 109);
            height: 100%;
            min-width: 50%;
        }
        .gauche.non-detail {
            width: 100%;
        }
        .droite {
            height: 100%;
            border: 1px solid rgb(109, 109, 109);
            width: 50%;
        }
    }
}
</style>
