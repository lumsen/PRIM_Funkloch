class Einsatz {
  constructor(data) {
    this.id = data.id;
    this.truppname = data.truppname;
    this.startzeit = new Date(data.startzeit);
    this.startort = data.startort;
    this.endort = data.endort;
    this.endzeit = new Date(data.endzeit);
    this.type = data.type || 'Unbekannt';
    this.description = data.description || '';
  }

  // Method to calculate duration in hours
  calculateDuration() {
    const durationMs = this.endzeit.getTime() - this.startzeit.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
  }

  // Method to check if the einsatz is active at a given time
  isActive(currentTime) {
    return this.startzeit <= currentTime && currentTime <= this.endzeit;
  }

  // Method to get the location at a given time
  getLocationAtTime(currentTime) {
    if (currentTime < this.startzeit) return this.startort;
    if (currentTime > this.endzeit) return this.endort;
    return this.startort; // Assuming static location during mission, adjust if needed
  }

  // Method to check if it's a movement mission
  isMovementMission() {
    return this.type === 'Bewegung';
  }

  // Method to check if it's a battery-related mission
  isBatteryMission() {
    return this.type === 'Batterie aufladen' || this.description.includes('Batterie');
  }

  // Method to get formatted string for display
  toFormattedString() {
    return `${this.truppname}: ${this.startort} -> ${this.endort} (${this.type}) [${this.startzeit.toLocaleString('de-DE')} - ${this.endzeit.toLocaleString('de-DE')}]`;
  }

  // Method to export to plain object for serialization
  toPlainObject() {
    return {
      id: this.id,
      truppname: this.truppname,
      startzeit: this.startzeit.toISOString(),
      startort: this.startort,
      endort: this.endort,
      endzeit: this.endzeit.toISOString(),
      type: this.type,
      description: this.description,
    };
  }
}

export default Einsatz;
