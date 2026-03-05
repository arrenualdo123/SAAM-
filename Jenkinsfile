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
        stage('Clean and Install Dependencies') {
            steps {
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm install'
            }
        }
        stage('Dependency Security Audit') {
            steps {
                // Ejecuta la auditoría pero permite continuar si hay vulnerabilidades
                sh 'npm audit --audit-level=moderate || true'
            }
        }
        stage('Run Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }
        stage('Run Tests with Coverage') {
            steps {
                script {
                    // Ejecuta el comando que pusiste en package.json
                    def exitCode = sh(script: 'npm run test', returnStatus: true)
                    if (exitCode != 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Las pruebas fallaron con código ${exitCode}."
                    }
                }
            }
            post {
                always {
                    // Genera el reporte visual en Jenkins
                    script {
                        if (fileExists('junit.xml')) {
                            junit 'junit.xml'
                        }
                    }
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                // Espera a que SonarQube dé el veredicto (Aprobado/Fallido)
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Build') {
            steps {
                // Exporta la versión web de tu App Parkinson
                sh 'npx expo export --platform web'
            }
        }
        stage('Archive Build Artifacts') {
            steps {
                // Guarda la carpeta dist para que puedas descargarla desde Jenkins
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
    post {
        always {
            // Limpia el espacio de trabajo al terminar
            cleanWs()
        }
    }
}