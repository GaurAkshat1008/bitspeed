import App from "./app";

try {
    const app = new App();
    app.start();
} catch(err) {
    console.error(err);
}