
$ZapApiKey = 'b2bzaptest'
$BrowserProxyHost = 'localhost'
$BrowserProxyPort = '8080'
$env:ZapProxy = '127.0.0.1:8080'
$ZapScanUrl = 'https://uat-atwork.woolworths.com.au/shop/securelogin'
function Zap_Start
{
    $CurrentDirectory = Get-Location
    Set-Location .\zap_binaries\ZAP_2.11.1
    Start-Process -File '.\zap.bat' -ArgumentList "-daemon -config api.key=${ZapApiKey}" 

    Set-Location $CurrentDirectory
    #Allow 20 sec for zap init
    Start-Sleep -s 20
    Write-Host "Zap has started and listening to" $BrowserProxyHost $BrowserProxyPort

    $Params = @{
        Uri         = "http://${BrowserProxyHost}:${BrowserProxyPort}/JSON/core/action/setOptionHttpStateEnabled/?zapapiformat=JSON&apikey=${ZapApiKey}&Boolean=true"
        Method      = "GET"
        ContentType = "application/json"
    }
    Write-Host "Enable All HttpState Scanners:" 

    $Params = @{
            Uri     = "http://${BrowserProxyHost}:${BrowserProxyPort}/HTML/pscan/action/enableAllScanners/?zapapiformat=HTML&apikey=${ZapApiKey}"
            Method  = "GET"
            ContentType = "application/json"
    }
    $Response = Invoke-WebRequest @Params
    Write-Host "Enable All Passive Scanners:" @Response
}

function Zap_Spider {
    Write-Host "Setting ZAP mode to attack"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/JSON/spider/action/setMode/?zapapiformat=JSON&apikey=${ZapApiKey}&mode=attack"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params

    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/JSON/spider/action/scan/?url=${ZapScanUrl}&apikey=${ZapApiKey}"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params
    Write-Host "Running Spider scan on url: ${ZapScanUrl}"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/XML/spider/view/status/?zapapiformat=XML&apikey=${ZapApiKey}&scanId="
        Method = "GET"
        ContentType = "application/json"
    }
    $SpiderStatus = Invoke-WebRequest @Params
    While(($SpiderStatus -Match "<status>100</status>") -ne $true){
        Start-Sleep -s 10
        Write-Host "Waiting for ZAP Spider to be completed: ${SpiderStatus}"
        $SpiderStatus = Invoke-WebRequest @Params
    }

    Write-Host "ZAP Spider scan completed: ${SpiderStatus}"
}

function Zap_ActiveScan {
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/HTML/ascan/removeScanPolicy/?zapapiformat=HTML&apikey=${ZapApiKey}&scanPolicyName=testAutomation"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params

    Write-Host "Setting Zap Scan Policy Name and Attack Strength: High"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/HTML/ascan/action/addScanPolicy/?zapapiformat=HTML&apikey=${ZapApiKey}&scanPolicyName=testAutomation&attackStrength=high"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params

    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/HTML/ascan/action/setOptionAllowAttackOnStart/?zapapiformat=HTML&apikey=${ZapApiKey}&Boolean=true"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params

    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/JSON/ascan/action/enableAllScanners/?zapapiformat=JSON&apikey=${ZapApiKey}"
        Method = "GET"
        ContentType = "application/json"
    }
    $EnableActiveScannerStatus = Invoke-WebRequest @Params
    Write-Host "Enabling All Active Scanners: ${EnableActiveScannerStatus}"
    Write-Host "Zap: Starting Active Scanning" $ZapScanUrl
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/JSON/ascan/action/scan/?zapapiformat=HTML&url=${ZapScanUrl}&apikey=${ZapApiKey}"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params
    Start-Sleep -s 20
    Write-Host "Running active scan on url: ${ZapScanUrl}"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/XML/spider/view/status/?zapapiformat=XML&apikey=${ZapApiKey}&scanId="
        Method = "GET"
        ContentType = "application/json"
    }
    $AscanStatus = Invoke-WebRequest @Params
    Write-Host "Active scan status" $AscanStatus
    While(($AscanStatus -Match "<state>FINISHED</state>") -ne $true){
        Start-Sleep -s 10
        Write-Host "Waiting for ZAP Active Scan to be completed: ${AscanStatus}"
        $AscanStatus = Invoke-WebRequest @Params
    }
    Write-Host "ZAP Active Scan Completed: ${AscanStatus}"
    Write-Host "Deleting Active Scan Policy"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/HTML/ascan/removeScanPolicy/?zapapiformat=HTML&apikey=${ZapApiKey}&scanPolicyName=testAutomation"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params
}
function Zap_Report {
    Invoke-WebRequest "http://${BrowserProxyHost}:${BrowserProxyPort}/OTHER/core/other/htmlreport/?apikey=${ZapApiKey}" -OutFile "./zap_report.html"
}

function Zap_Shutdown{
    Write-Host "Shutting Down ZapProxy Server"
    $Params = @{
        Uri = "http://${BrowserProxyHost}:${BrowserProxyPort}/json/core/action/shutdown/?apikey=${ZapApiKey}"
        Method = "GET"
        ContentType = "application/json"
    }
    Invoke-WebRequest @Params
}
function Run_Security_Test{
    Zap_Start
    #Build
    #Run Test
    #Zap_Spider
    Zap_ActiveScan
    Zap_Report
    Zap_Shutdown
}

Run_Security_Test