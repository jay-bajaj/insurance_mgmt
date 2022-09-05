DROP DATABASE insurance_mgmt;
CREATE DATABASE insurance_mgmt;

CREATE TABLE admins (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL,
    contact INT ,
    email VARCHAR(50),

);

CREATE TABLE employee (
    system_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(50) NOT NULL, 
    contact INT,
    email VARCHAR(50)
);

CREATE TABLE agent (
    system_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    commission INT DEFAULT 0
);



CREATE TABLE insurancepolicy(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(50) ,
    type VARCHAR(50) NOT NULL DEFAULT 'MISC',
    agent_id INT NOT NULL 
);

CREATE TABLE client (
    id INT NOT NULL AUTO_INCREMENT  PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    contact INT, 
    address VARCHAR(250),
    email VARCHAR(50)
);

CREATE TABLE agent_client(
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    PRIMARY KEY (agent_id,client_id),
    FOREIGN KEY (agent_id) REFERENCES agent(id),
    FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE client_insurancepolicy(
    client_id INT NOT NULL ,
    policy_id INT NOT NULL,
    PRIMARY KEY(client_id,insurancepolicy_id),
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (policy_id) REFERENCES insurancepolicy(id)
);
