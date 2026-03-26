<template>
  <div class="space-y-3">
    <UCard v-for="n in 4" :key="n">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-4 w-3/4 rounded bg-muted/20 animate-pulse" />
          <div class="flex items-center gap-2">
            <div class="h-3 w-16 rounded bg-muted/20 animate-pulse" />
            <div class="h-3 w-3 rounded-full bg-muted/20 animate-pulse" />
            <div class="h-3 w-12 rounded bg-muted/20 animate-pulse" />
          </div>
        </div>
        <div class="h-5 w-8 rounded bg-muted/20 animate-pulse shrink-0" />
      </div>
    </UCard>
  </div>
</template>
