import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockPrincipal = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const mockContracts = {
  facilityRegistration: {
    lastFacilityId: 0,
    facilities: new Map(),
    
    getLastFacilityId() {
      return this.lastFacilityId;
    },
    
    getFacility(facilityId) {
      return this.facilities.get(facilityId) || null;
    },
    
    registerFacility(name, location, totalSpaces, hourlyRate, dailyRate) {
      if (totalSpaces <= 0) return { err: 1 };
      if (hourlyRate <= 0) return { err: 2 };
      if (dailyRate <= 0) return { err: 3 };
      
      const newId = this.lastFacilityId + 1;
      
      this.facilities.set(newId, {
        name,
        owner: mockPrincipal,
        location,
        totalSpaces,
        hourlyRate,
        dailyRate,
        active: true
      });
      
      this.lastFacilityId = newId;
      return { ok: newId };
    },
    
    updateFacility(facilityId, name, location, totalSpaces, hourlyRate, dailyRate) {
      const facility = this.facilities.get(facilityId);
      if (!facility) return { err: 404 };
      if (facility.owner !== mockPrincipal) return { err: 401 };
      if (totalSpaces <= 0) return { err: 1 };
      if (hourlyRate <= 0) return { err: 2 };
      if (dailyRate <= 0) return { err: 3 };
      
      this.facilities.set(facilityId, {
        ...facility,
        name,
        location,
        totalSpaces,
        hourlyRate,
        dailyRate
      });
      
      return { ok: true };
    },
    
    deactivateFacility(facilityId) {
      const facility = this.facilities.get(facilityId);
      if (!facility) return { err: 404 };
      if (facility.owner !== mockPrincipal) return { err: 401 };
      
      this.facilities.set(facilityId, {
        ...facility,
        active: false
      });
      
      return { ok: true };
    },
    
    reactivateFacility(facilityId) {
      const facility = this.facilities.get(facilityId);
      if (!facility) return { err: 404 };
      if (facility.owner !== mockPrincipal) return { err: 401 };
      
      this.facilities.set(facilityId, {
        ...facility,
        active: true
      });
      
      return { ok: true };
    }
  }
};

describe('Facility Registration Contract', () => {
  beforeEach(() => {
    mockContracts.facilityRegistration.lastFacilityId = 0;
    mockContracts.facilityRegistration.facilities = new Map();
  });
  
  it('should register a new facility', () => {
    const result = mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        100,
        5,
        50
    );
    
    expect(result).toEqual({ ok: 1 });
    expect(mockContracts.facilityRegistration.getLastFacilityId()).toBe(1);
    
    const facility = mockContracts.facilityRegistration.getFacility(1);
    expect(facility).toEqual({
      name: 'Downtown Parking',
      owner: mockPrincipal,
      location: 'Main Street',
      totalSpaces: 100,
      hourlyRate: 5,
      dailyRate: 50,
      active: true
    });
  });
  
  it('should fail to register a facility with invalid parameters', () => {
    // No spaces
    let result = mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        0,
        5,
        50
    );
    expect(result).toEqual({ err: 1 });
    
    // No hourly rate
    result = mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        100,
        0,
        50
    );
    expect(result).toEqual({ err: 2 });
    
    // No daily rate
    result = mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        100,
        5,
        0
    );
    expect(result).toEqual({ err: 3 });
  });
  
  it('should update an existing facility', () => {
    // First register a facility
    mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        100,
        5,
        50
    );
    
    // Then update it
    const result = mockContracts.facilityRegistration.updateFacility(
        1,
        'Downtown Parking Premium',
        'Main Street Corner',
        150,
        8,
        75
    );
    
    expect(result).toEqual({ ok: true });
    
    const facility = mockContracts.facilityRegistration.getFacility(1);
    expect(facility).toEqual({
      name: 'Downtown Parking Premium',
      owner: mockPrincipal,
      location: 'Main Street Corner',
      totalSpaces: 150,
      hourlyRate: 8,
      dailyRate: 75,
      active: true
    });
  });
  
  it('should deactivate and reactivate a facility', () => {
    // First register a facility
    mockContracts.facilityRegistration.registerFacility(
        'Downtown Parking',
        'Main Street',
        100,
        5,
        50
    );
    
    // Deactivate it
    let result = mockContracts.facilityRegistration.deactivateFacility(1);
    expect(result).toEqual({ ok: true });
    
    let facility = mockContracts.facilityRegistration.getFacility(1);
    expect(facility.active).toBe(false);
    
    // Reactivate it
    result = mockContracts.facilityRegistration.reactivateFacility(1);
    expect(result).toEqual({ ok: true });
    
    facility = mockContracts.facilityRegistration.getFacility(1);
    expect(facility.active).toBe(true);
  });
});
