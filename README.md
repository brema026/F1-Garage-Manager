# F1 Garage Manager

**F1 Garage Manager** is an academic project developed for the course **CE-3101 – Database Systems**, focused on the design and implementation of a relational database system for managing a **Formula 1 garage environment**.

The project prioritizes correct database modeling, normalization, and enforcement of business rules through a structured, clear, and scalable design.

---

## Project Description

The system is designed to manage core entities involved in a Formula 1 context, including:

- Teams  
- Cars  
- Drivers  
- Sponsors  
- Parts  
- Car configurations (setups)  
- Race simulations  

The project places strong emphasis on:

- Data consistency  
- Referential integrity  
- Alignment with real-world business constraints of the Formula 1 domain  

The database layer is implemented using **Microsoft SQL Server** and is based on a formally defined **Entity–Relationship (ER) model** and its corresponding logical representation.

---

## Scope and Objectives

The main objectives of this project are to:

- Design a coherent and normalized relational database model.
- Translate the conceptual ER model into a logical schema.
- Define tables with appropriate primary keys (PK) and foreign keys (FK).
- Enforce essential business rules directly at the database level.
- Provide dummy data to validate relationships and verify the correctness of the model.
- Prepare the system for future integration with application layers.

---

## Database Design Approach

The database design follows these principles:

- Clear definition of entities and relationships based on the project domain.
- Proper resolution of many-to-many relationships using intermediate tables.
- Enforcement of data validity through constraints such as:
  - `NOT NULL`
  - `UNIQUE`
  - `CHECK`
- Separation between structural definitions (schema) and test data (dummy inserts).

The schema has been implemented and validated using **SQL Server Management Studio (SSMS)**.

---

## Development Notes

- All data used in this project is **fictional** and intended solely for academic and testing purposes.
- Database scripts are designed to be reproducible in a clean environment.
- The database layer is kept independent from the frontend to ensure modularity.
- The project follows good practices in database organization and documentation.

---

## Team Members

- Ian Yoel Gómez Oses
- Mauro Brenes Brenes  
- Steven Aguilar Álvarez  
- Sebastián Chaves Ruiz    

---

## Disclaimer

- This project is developed exclusively for academic purposes.
- It does not contain real data.
- Any resemblance to real teams, drivers, or organizations is purely coincidental.

---

*This project is part of the academic learning process in database design and management.*
