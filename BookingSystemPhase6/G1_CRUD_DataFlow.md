# G1 CRUD Data Flow — Observation Notes

| Operation | UI action | Frontend file | Method | Endpoint | Payload? | Success status | Failure status |
|---|---|---|---|---|---|---|---|
| Create | Submit resource form | form.js / resources.js | POST | `/api/resources` | JSON body | `201 Created` | `400` validation error / `409` duplicate / `500` database error |
| Read | Load resource list | resources.js | GET | `/api/resources` | No request body | `200 OK`; sometimes `304 Not Modified` when cached | `500` database error |
| Update | Edit/save resource | form.js / resources.js | PUT | `/api/resources/:id`, observed `/api/resources/2` | JSON body | `200 OK` | `400` invalid id or validation error / `404` not found / `409` duplicate / `500` database error |
| Delete | Delete resource | form.js / resources.js | DELETE | `/api/resources/:id`, observed `/api/resources/2` | No request body | `204 No Content` | `400` invalid id / `404` not found / `500` database error |

Note: The backend route file confirms the CRUD endpoints. `GET /api/resources` performs `SELECT * FROM resources ORDER BY created_at DESC` and returns `{ ok: true, data: rows }` with status `200`. `GET /api/resources/:id` validates the id, returns `400` for invalid id, `404` if no resource exists, and `200` with one resource when found. Update uses `PUT /api/resources/:id` with `resourceValidators`, updates the row with `UPDATE resources ... WHERE id = $6 RETURNING *`, and returns `200`. Delete uses `DELETE /api/resources/:id`, deletes by id, logs the event, and returns `204 No Content`.

Note: Updating resource id `2` sent a `PUT` request to `/api/resources/2` with `Content-Type: application/json`. The backend returned `200 OK` with a JSON response. After the update succeeded, the frontend also sent `GET /api/resources`, which returned `200 OK`, meaning the UI refreshed/reloaded the resource list.

Note: Deleting resource id `2` sent a `DELETE` request to `/api/resources/2`. The request was initiated from `form.js:154` and returned `204 No Content`, meaning the delete succeeded and the backend did not return a response body. After the delete succeeded, the frontend sent `GET /api/resources`, initiated from `resources.js:434`, and received `200 OK`, meaning the resource list was refreshed after deletion.

# 1️⃣ CREATE – Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant DB as PostgreSQL
    participant L as Log Service

    U->>F: Submit form
    F->>F: Client-side validation
    F->>B: POST /api/resources (JSON)

    B->>V: Validate request with resourceValidators
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + { ok: false, errors[] }
        F-->>U: Show validation message
    else Validation OK
        B->>DB: INSERT INTO resources (name, description, available, price, price_unit)
        DB-->>B: Created row / duplicate error

        alt Duplicate resource name
            B->>L: logEvent("Duplicate resource blocked")
            L-->>B: Log saved
            B-->>F: 409 Conflict + { ok: false, error: "Duplicate resource name" }
            F-->>U: Show duplicate message
        else Database error
            B-->>F: 500 Internal Server Error + { ok: false, error: "Database error" }
            F-->>U: Show database error message
        else Success
            B->>L: logEvent("Resource created")
            L-->>B: Log saved
            B-->>F: 201 Created + { ok: true, data: createdResource }
            F-->>U: Show success message
        end
    end
```

# 2️⃣ READ — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant DB as PostgreSQL

    U->>F: Open / refresh Resources page
    F->>B: GET /api/resources

    B->>DB: SELECT * FROM resources ORDER BY created_at DESC
    DB-->>B: Resource rows

    alt Success
        B-->>F: 200 OK + { ok: true, data: rows }
        F-->>U: Render resource list
    else Cached response
        B-->>F: 304 Not Modified
        F-->>U: Use cached resource list
    else Database error
        DB-->>B: Query error
        B-->>F: 500 Database error
        F-->>U: Show error message
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant DB as PostgreSQL
    participant L as Log Service

    U->>F: Edit existing resource and submit form
    F->>F: Client-side validation
    F->>B: PUT /api/resources/:id (JSON)

    B->>B: Convert req.params.id to Number
    B->>V: Validate request body with resourceValidators
    V-->>B: Validation result

    alt Invalid ID
        B-->>F: 400 Bad Request + { ok: false, error: "Invalid ID" }
        F-->>U: Show invalid resource error
    else Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>DB: UPDATE resources SET ... WHERE id = $6 RETURNING *
        DB-->>B: Updated row / no row / duplicate error

        alt Resource not found
            B-->>F: 404 Not Found + { ok: false, error: "Resource not found" }
            F-->>U: Show not found message
        else Duplicate name
            B-->>F: 409 Conflict + { ok: false, error: "Duplicate resource name" }
            F-->>U: Show duplicate message
        else Database error
            B-->>F: 500 Internal Server Error + { ok: false, error: "Database error" }
            F-->>U: Show database error message
        else Success
            B->>L: logEvent("Resource updated")
            L-->>B: Log saved
            B-->>F: 200 OK + { ok: true, data: updatedResource }
            F->>B: GET /api/resources
            B->>DB: SELECT * FROM resources ORDER BY created_at DESC
            DB-->>B: Resource rows
            B-->>F: 200 OK + { ok: true, data: rows }
            F-->>U: Refresh resource list
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant DB as PostgreSQL
    participant L as Log Service

    U->>F: Click delete for resource
    F->>B: DELETE /api/resources/:id

    B->>B: Convert req.params.id to Number

    alt Invalid ID
        B-->>F: 400 Bad Request + { ok: false, error: "Invalid ID" }
        F-->>U: Show invalid resource error
    else Valid ID
        B->>DB: DELETE FROM resources WHERE id = $1
        DB-->>B: rowCount result

        alt Resource not found
            B-->>F: 404 Not Found + { ok: false, error: "Resource not found" }
            F-->>U: Show not found message
        else Database error
            B-->>F: 500 Internal Server Error + { ok: false, error: "Database error" }
            F-->>U: Show database error message
        else Success
            B->>L: logEvent("Resource deleted")
            L-->>B: Log saved
            B-->>F: 204 No Content
            F->>B: GET /api/resources
            B->>DB: SELECT * FROM resources ORDER BY created_at DESC
            DB-->>B: Resource rows
            B-->>F: 200 OK + { ok: true, data: rows }
            F-->>U: Refresh resource list
        end
    end
```