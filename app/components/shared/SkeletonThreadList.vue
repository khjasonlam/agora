<template>
  <div>
    <div v-for="n in 4" :key="n" class="flex gap-3">
      <div class="flex flex-col items-center shrink-0">
        <div class="size-8 rounded-full bg-muted/20 animate-pulse" />
        <div v-if="n < 4" class="w-px flex-1 bg-default mt-2" />
      </div>
      <div class="flex-1 pb-6 space-y-2">
        <div class="flex items-center gap-2 mb-1">
          <div class="h-3.5 w-20 rounded bg-muted/20 animate-pulse" />
          <div class="h-4 w-6 rounded bg-muted/20 animate-pulse" />
        </div>
        <div class="h-3.5 w-full rounded bg-muted/20 animate-pulse" />
        <div class="h-3.5 w-2/3 rounded bg-muted/20 animate-pulse" />
      </div>
    </div>
  </div>
</template>
