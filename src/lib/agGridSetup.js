// import { ModuleRegistry, ValidationModule } from "ag-grid-community";
// import { AllEnterpriseModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([
//   AllEnterpriseModule,
//   ValidationModule,
// ]);

// import { ModuleRegistry, provideGlobalGridOptions } from "ag-grid-community";
// import { AllEnterpriseModule, } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([
//     AllEnterpriseModule,
// ]);

// provideGlobalGridOptions({
//     theme: "legacy",
// });
import { ModuleRegistry, provideGlobalGridOptions, PaginationModule } from "ag-grid-community";
import { AllEnterpriseModule, IntegratedChartsModule } from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";

ModuleRegistry.registerModules([
    AllEnterpriseModule,
    PaginationModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);

provideGlobalGridOptions({
    theme: "legacy",
});