#!/usr/bin/env python3
"""
إصلاح أخطاء admin في alistpros_profiles
"""

def fix_admin_file():
    file_path = "alistpros_profiles/admin.py"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # إصلاح ServiceQuoteAdmin
    content = content.replace(
        "list_display = [\n        'id', 'service_request_title', 'professional_name', 'total_price', \n        'status_badge', 'start_date', 'expires_at', 'created_at'\n    ]",
        "list_display = [\n        'id', 'service_request_title', 'professional_name', 'total_price', \n        'status_badge', 'status', 'start_date', 'expires_at', 'created_at'\n    ]"
    )
    
    # إصلاح JobAssignmentAdmin
    content = content.replace(
        "list_display = [\n        'id', 'service_request_title', 'professional_name', 'client_name',\n        'total_amount', 'status_badge', 'payment_status_badge', 'start_date', 'actual_completion_date'\n    ]",
        "list_display = [\n        'id', 'service_request_title', 'professional_name', 'client_name',\n        'total_amount', 'status_badge', 'status', 'payment_status_badge', 'payment_status', 'start_date', 'actual_completion_date'\n    ]"
    )
    
    # إصلاح AvailabilityAdmin
    content = content.replace(
        "list_display = [\n        'id', 'professional_name', 'weekday_display', 'time_range', 'available_status'\n    ]",
        "list_display = [\n        'id', 'professional_name', 'weekday_display', 'time_range', 'available_status', 'is_available'\n    ]"
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ تم إصلاح أخطاء admin في alistpros_profiles!")

if __name__ == "__main__":
    fix_admin_file() 