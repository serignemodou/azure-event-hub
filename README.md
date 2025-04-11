![Architecture](/images/SOC-Event%20HUB.jpg)
1. Azure service (Producer), produire les logs et les envoyer vers event hub via diagnostics settings
2. Azure Event Hub (Consumer): consomme les logs des services azure
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