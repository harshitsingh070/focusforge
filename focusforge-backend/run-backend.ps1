param(
    [int]$Port = 8080
)

$jdkCandidates = @(
    "C:\Program Files\Java\jdk-22",
    "C:\Program Files\Java\jdk-21"
)

$selectedJdk = $jdkCandidates | Where-Object { Test-Path "$_\bin\java.exe" } | Select-Object -First 1

if (-not $selectedJdk) {
    Write-Error "No supported JDK found. Install JDK 22 or JDK 21 under C:\Program Files\Java."
    exit 1
}

$env:JAVA_HOME = $selectedJdk
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"

$portOwner = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    Select-Object -First 1 -ExpandProperty OwningProcess

if ($portOwner) {
    try {
        $proc = Get-Process -Id $portOwner -ErrorAction Stop
        Write-Host "Port $Port is already in use by PID $($proc.Id) ($($proc.ProcessName))."
        Write-Host "Stop it first: Stop-Process -Id $($proc.Id) -Force"
        exit 1
    } catch {
        Write-Host "Port $Port is in use by PID $portOwner."
        exit 1
    }
}

$runArgs = @(
    "spring-boot:run",
    "-Dmaven.test.skip=true"
)

if ($Port -ne 8080) {
    $runArgs += "-Dspring-boot.run.arguments=--server.port=$Port"
}

& .\mvnw.cmd @runArgs
