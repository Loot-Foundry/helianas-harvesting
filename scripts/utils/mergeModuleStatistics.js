export function mergeModuleStatistics(target, results) {
    target.loaded += results.loaded;
    target.replaced += results.replaced;
    target.errors += results.errors;
}
