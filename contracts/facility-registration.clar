;; Facility Registration Contract
;; Records details of parking structures

(define-data-var last-facility-id uint u0)

(define-map facilities
  { facility-id: uint }
  {
    name: (string-ascii 100),
    owner: principal,
    location: (string-ascii 100),
    total-spaces: uint,
    hourly-rate: uint,
    daily-rate: uint,
    active: bool
  }
)

(define-read-only (get-facility (facility-id uint))
  (map-get? facilities { facility-id: facility-id })
)

(define-read-only (get-last-facility-id)
  (var-get last-facility-id)
)

(define-public (register-facility
    (name (string-ascii 100))
    (location (string-ascii 100))
    (total-spaces uint)
    (hourly-rate uint)
    (daily-rate uint))
  (let
    ((new-id (+ (var-get last-facility-id) u1)))
    (asserts! (> total-spaces u0) (err u1)) ;; Must have at least one space
    (asserts! (> hourly-rate u0) (err u2)) ;; Rates must be positive
    (asserts! (> daily-rate u0) (err u3)) ;; Rates must be positive

    (map-set facilities
      { facility-id: new-id }
      {
        name: name,
        owner: tx-sender,
        location: location,
        total-spaces: total-spaces,
        hourly-rate: hourly-rate,
        daily-rate: daily-rate,
        active: true
      }
    )

    (var-set last-facility-id new-id)
    (ok new-id)
  )
)

(define-public (update-facility
    (facility-id uint)
    (name (string-ascii 100))
    (location (string-ascii 100))
    (total-spaces uint)
    (hourly-rate uint)
    (daily-rate uint))
  (let
    ((facility (unwrap! (get-facility facility-id) (err u404))))

    (asserts! (is-eq tx-sender (get owner facility)) (err u401))
    (asserts! (> total-spaces u0) (err u1))
    (asserts! (> hourly-rate u0) (err u2))
    (asserts! (> daily-rate u0) (err u3))

    (map-set facilities
      { facility-id: facility-id }
      {
        name: name,
        owner: tx-sender,
        location: location,
        total-spaces: total-spaces,
        hourly-rate: hourly-rate,
        daily-rate: daily-rate,
        active: true
      }
    )

    (ok true)
  )
)

(define-public (deactivate-facility (facility-id uint))
  (let
    ((facility (unwrap! (get-facility facility-id) (err u404))))

    (asserts! (is-eq tx-sender (get owner facility)) (err u401))

    (map-set facilities
      { facility-id: facility-id }
      (merge facility { active: false })
    )

    (ok true)
  )
)

(define-public (reactivate-facility (facility-id uint))
  (let
    ((facility (unwrap! (get-facility facility-id) (err u404))))

    (asserts! (is-eq tx-sender (get owner facility)) (err u401))

    (map-set facilities
      { facility-id: facility-id }
      (merge facility { active: true })
    )

    (ok true)
  )
)
