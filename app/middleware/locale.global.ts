export default defineNuxtRouteMiddleware((to) => loadLocale(localeFromPath(to.path)))
