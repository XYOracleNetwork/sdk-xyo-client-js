// tsup.config.ts
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig({
  bundle: true,
  cjsInterop: true,
  clean: false,
  dts: {
    entry: ["src/index.ts"]
  },
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  splitting: false,
  tsconfig: "tsconfig.build.json"
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2FyaWV0cm91dy9HaXRIdWIvWFlPcmFjbGVOZXR3b3JrL3Nkay14eW8tY2xpZW50LWpzL3BhY2thZ2VzL3NoYXJlZC9wYWNrYWdlcy9wcm9taXNhYmxlL3RzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9hcmlldHJvdXcvR2l0SHViL1hZT3JhY2xlTmV0d29yay9zZGsteHlvLWNsaWVudC1qcy9wYWNrYWdlcy9zaGFyZWQvcGFja2FnZXMvcHJvbWlzYWJsZVwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvYXJpZXRyb3V3L0dpdEh1Yi9YWU9yYWNsZU5ldHdvcmsvc2RrLXh5by1jbGllbnQtanMvcGFja2FnZXMvc2hhcmVkL3BhY2thZ2VzL3Byb21pc2FibGUvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWRlZmF1bHQtZXhwb3J0XG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidW5kbGU6IHRydWUsXG4gIGNqc0ludGVyb3A6IHRydWUsXG4gIGNsZWFuOiBmYWxzZSxcbiAgZHRzOiB7XG4gICAgZW50cnk6IFsnc3JjL2luZGV4LnRzJ10sXG4gIH0sXG4gIGVudHJ5OiBbJ3NyYy9pbmRleC50cyddLFxuICBmb3JtYXQ6IFsnY2pzJywgJ2VzbSddLFxuICBzb3VyY2VtYXA6IHRydWUsXG4gIHNwbGl0dGluZzogZmFsc2UsXG4gIHRzY29uZmlnOiAndHNjb25maWcuYnVpbGQuanNvbicsXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxYSxTQUFTLG9CQUFvQjtBQUdsYyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsRUFDUixZQUFZO0FBQUEsRUFDWixPQUFPO0FBQUEsRUFDUCxLQUFLO0FBQUEsSUFDSCxPQUFPLENBQUMsY0FBYztBQUFBLEVBQ3hCO0FBQUEsRUFDQSxPQUFPLENBQUMsY0FBYztBQUFBLEVBQ3RCLFFBQVEsQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNyQixXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxVQUFVO0FBQ1osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
