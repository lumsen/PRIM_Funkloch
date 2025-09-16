class Trupp {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.staerke = data.staerke;
    this.reichweite = data.reichweite;
    this.geschwindigkeit = data.geschwindigkeit;
    this.ruhezeit = data.ruhezeit || 0; // Default to 0 for Techniktrupps
    this.ausruestung = data.ausruestung;
    this.aktuellerEinsatzpunkt = data.aktuellerEinsatzpunkt;
    this.naechsteVerfuegbarkeit = new Date(data.naechsteVerfuegbarkeit);
    this.einsatzzeitMax = data.einsatzzeitMax || 0;
    this.verbleibendeBatteriezeit = data.verbleibendeBatteriezeit || 0;
    this.benoetigtBatterie = data.benoetigtBatterie || false;
  }

  // Method to check if the trupp is available at a given time
  isAvailable(currentTime) {
    return this.naechsteVerfuegbarkeit <= currentTime;
  }

  // Method to get effective range based on current settings
  getEffectiveRange() {
    return this.reichweite;
  }

  // Method to calculate travel time in hours for a given distance
  calculateTravelTime(distance) {
    if (this.geschwindigkeit <= 0) return Infinity;
    return distance / this.geschwindigkeit;
  }

  // Method to deplete battery
  depleteBattery(timeUsed) {
    if (this.ausruestung === 'Batterie') {
      this.verbleibendeBatteriezeit -= timeUsed;
      if (this.verbleibendeBatteriezeit <= 0) {
        this.benoetigtBatterie = true;
      }
    }
  }

  // Method to recharge battery
  rechargeBattery() {
    if (this.ausruestung === 'Batterie') {
      this.verbleibendeBatteriezeit = this.einsatzzeitMax;
      this.benoetigtBatterie = false;
    }
  }

  // Method to set next availability after operation
  setNextAvailability(operationEndTime) {
    const restTimeMs = this.ruhezeit * 60 * 60 * 1000;
    this.naechsteVerfuegbarkeit = new Date(operationEndTime.getTime() + restTimeMs);
  }

  // Method to check if special equipment is required for a risk level
  hasRequiredEquipment(riskLevel) {
    if (riskLevel >= 4 && !['CombatMedic', 'Überwachung'].includes(this.ausruestung)) return false;
    if (riskLevel >= 5 && this.ausruestung !== 'Veteran') return false;
    return true;
  }

  // Method to get display info
  toDisplayString() {
    return `${this.name} (${this.staerke} Stärke, ${this.geschwindigkeit} km/h)`;
  }

  // Method to export to plain object for serialization
  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      staerke: this.staerke,
      reichweite: this.reichweite,
      geschwindigkeit: this.geschwindigkeit,
      ruhezeit: this.ruhezeit,
      ausruestung: this.ausruestung,
      aktuellerEinsatzpunkt: this.aktuellerEinsatzpunkt,
      naechsteVerfuegbarkeit: this.naechsteVerfuegbarkeit.toISOString(),
      einsatzzeitMax: this.einsatzzeitMax,
      verbleibendeBatteriezeit: this.verbleibendeBatteriezeit,
      benoetigtBatterie: this.benoetigtBatterie,
    };
  }
}

export default Trupp;
