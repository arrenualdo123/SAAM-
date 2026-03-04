pipeline {
    agent any
    tools {
        nodejs 'Node' 
    }
    environment {
        SONAR_TOKEN = credentials('sonar-token') 
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/arrenualdo123/SAAM-.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('SonarQube Analysis') {
        steps {
        withSonarQubeEnv('SonarQube') {
            script {
                // Cambia 'SonarQube Scanner' por 'sonar-scanner'
                def scannerHome = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                sh "${scannerHome}/bin/sonar-scanner"
            }
        }
    }
}
    
    }
}