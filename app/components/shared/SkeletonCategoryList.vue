<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <UCard v-for="n in 6" :key="n">
      <div class="flex items-center gap-3">
        <div class="size-10 rounded-lg bg-muted/20 animate-pulse shrink-0" />
        <div class="h-4 w-24 rounded bg-muted/20 animate-pulse" />
      </div>
    </UCard>
  </div>
</template>
