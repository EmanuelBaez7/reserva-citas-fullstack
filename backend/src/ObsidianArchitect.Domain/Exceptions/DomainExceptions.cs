namespace ObsidianArchitect.Domain.Exceptions;

public class BusinessRuleException : Exception
{
    public string Code { get; }

    public BusinessRuleException(string message, string code = "BUSINESS_RULE_VIOLATION")
        : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : Exception
{
    public NotFoundException(string entity, object key)
        : base($"{entity} with key '{key}' was not found.") { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "You do not have permission to perform this action.")
        : base(message) { }
}
