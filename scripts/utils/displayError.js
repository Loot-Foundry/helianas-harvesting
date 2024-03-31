export function displayError(friendlyError, error) {
    ui.notifications.error(friendlyError);
    console.error("Heliana's Harvesting |", friendlyError);
    console.error("Heliana's Harvesting |", error);
}
