# Script to generate placeholder page components

$pages = @(
    @{ Name = "StudentDashboard"; Path = "dashboard" },
    @{ Name = "RegisterAgent"; Path = "auth" },
    @{ Name = "RegisterStudent"; Path = "auth" },
    @{ Name = "ForgotPassword"; Path = "auth" },
    @{ Name = "ResetPassword"; Path = "auth" },
    @{ Name = "AgentList"; Path = "agents" },
    @{ Name = "AgentDetails"; Path = "agents" },
    @{ Name = "PendingAgents"; Path = "agents" },
    @{ Name = "UniversityList"; Path = "universities" },
    @{ Name = "UniversityForm"; Path = "universities" },
    @{ Name = "UniversityDetails"; Path = "universities" },
    @{ Name = "CourseList"; Path = "courses" },
    @{ Name = "CourseForm"; Path = "courses" },
    @{ Name = "CourseDetails"; Path = "courses" },
    @{ Name = "StudentList"; Path = "students" },
    @{ Name = "StudentForm"; Path = "students" },
    @{ Name = "StudentDetails"; Path = "students" },
    @{ Name = "ApplicationList"; Path = "applications" },
    @{ Name = "ApplicationForm"; Path = "applications" },
    @{ Name = "ApplicationDetails"; Path = "applications" },
    @{ Name = "CommissionList"; Path = "commissions" },
    @{ Name = "CommissionForm"; Path = "commissions" },
    @{ Name = "PayoutList"; Path = "payouts" },
    @{ Name = "PayoutRequests"; Path = "payouts" },
    @{ Name = "AgentEarnings"; Path = "payouts" },
    @{ Name = "AuditLogList"; Path = "audit-logs" }
)

foreach ($page in $pages) {
    $content = @"
import React from 'react';

const $($page.Name) = () => {
  return (
    <div>
      <h1>$($page.Name)</h1>
      <p>This page is under construction...</p>
    </div>
  );
};

export default $($page.Name);
"@
    
    $filePath = "src\pages\$($page.Path)\$($page.Name).jsx"
    Set-Content -Path $filePath -Value $content
    Write-Host "Created $filePath"
}

Write-Host "All placeholder pages created successfully!"
