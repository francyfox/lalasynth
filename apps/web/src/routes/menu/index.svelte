<!-- routify:meta _auth=true -->
<script lang="ts">

    import AppMainMenu from '@/components/main-menu/AppMainMenu.svelte'

    const mainMenuBg = "http://localhost:3000/static/bg/menu_bg.webp"
    const mainMenuStyle = `background: url(${mainMenuBg}) center center / cover no-repeat;`
</script>

<section class="main-menu h-full" style={mainMenuStyle}>
    <div class="mx-auto container relative">
        <div class="fixed bottom-[20vh] flex flex-col gap-5">
            <h1 class="text-center text-4xl bg-[#c0c0c0] text-black py-1 px-2 shadow-[1px_1px_0_rgba(0,0,0,1),-1px_-1px_0_rgba(255,255,255,1)]">
                Lalasynth
            </h1>

            <AppMainMenu />
        </div>
    </div>
</section>

<style lang="postcss">
</style>