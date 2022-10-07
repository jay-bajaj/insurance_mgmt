DROP DATABASE insurance_mgmt;
CREATE DATABASE insurance_mgmt;

CREATE TABLE admins (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL,
    contact VARCHAR(30),
    email VARCHAR(50)
);

CREATE TABLE employee (
    system_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(50) NOT NULL, 
    contact VARCHAR(30),
    email VARCHAR(50)
);

CREATE TABLE agent (
    name VARCHAR(50),
    system_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    commission DECIMAL(3,2) DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE insurancepolicy(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    policytype VARCHAR(50) NOT NULL DEFAULT 'MISC',
    duration INT NOT NULL,
    policyvalue BIGINT NOT NULL
  );

CREATE TABLE client (
    id INT NOT NULL AUTO_INCREMENT  PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    contact VARCHAR(30), 
    address VARCHAR(250),
    email VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_client(
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    PRIMARY KEY (agent_id,client_id),
    FOREIGN KEY (agent_id) REFERENCES agent(id),
    FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE client_policy(
    client_id INT NOT NULL ,
    policy_id INT NOT NULL,
    agent_id INT NOT  NULL,
    enrolled_on TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY(client_id,policy_id,agent_id),
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (policy_id) REFERENCES insurancepolicy(id),
    FOREIGN KEY (agent_id) REFERENCES agent(system_id)
);

CREATE TABLE company(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
 );

 CREATE TABLE agent_policy(
     agent_id INT NOT NULL,
     policy_id INT NOT NULL,
     PRIMARY KEY (agent_id,policy_id),
     FOREIGN KEY (policy_id) REFERENCES insurancepolicy(id),
     FOREIGN KEY (agent_id) REFERENCES agent(system_id),
 );

 CREATE TABLE company_policy (
    company_id INT NOT NULL,
    policy_id INT NOT NULL,
    PRIMARY KEY (company_id,policy_id),
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (policy_id) REFERENCES insurancepolicy(id)
 );

 CREATE TABLE request (
    client_id INT NOT NULL ,
    agent_id INT NOT NULL,
    policy_id INT NOT NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (client_id,policy_id);
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (agent_id) REFERENCES agent(system_id),
    FOREIGN KEY (policy_id) REFERENCES insurancepolicy(id)
 );