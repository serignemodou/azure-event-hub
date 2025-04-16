![Architecture](/images/SOC-Event%20HUB.jpg)
1. Azure service (Producer), produire les logs et les envoyer vers event hub via diagnostics settings
2. Azure Event Hub (Consumer): consomme les logs des services azure
3. Donner les permissions à evenhub de pouvoir lire les logs depuis les consuers.
3. Filebeat: Déployer sur kubernetes, container App ou VM, pull les données depuis Event hub, en utilisant une identité managé pour authentification et autorisation.
4. Storage Account (Checkpoint OffSet): Utiliser comme checkpoint pour assurer que filebeat lu la meme données à plusiers fois. 
5. Azure Firewall: Utiliser pour
    - Une controle de sécurité
        1. Centraliser et rediriger les données sortante vers une destination spécifique, kafka (port/IP)
    - Forcer le traffic à passer sur un chemin sécurisé (Express Route, VPN)
    - Filtrage du traffic sortant
6. Kafka
7. Logstash
8. Elasticsearch

====================== Simple use case ===============

1. Create event hub
- Create event hub namespace
- Create event hub namespace AuthorizationRule with [Listen, send, manage] permissions
- Create envHub
- export eventHub name, eventHub connection string

2. Create storage account
- Create storage account
- Create container
- Create storage account SaS Token
- Export storage account name, container name, sasTpken

3. Kafka
- Déploy kafka sur un container

4. Create filebeat
- Create a custom Dockerfile for filebeat
- Create filebeat.yml config (input evenHub and storageAccount, output kafka)
- Build, push and deploy containers in webApp container, containerApp or AKS
- Place containerApp, WebApp or AKS in the subnet that connected to ServiceEnpoint


5. Create Keyvault as producer
- Create keyvault
- Enable diagnostics settings
- Push logs to evenHub