using System.Net;
using System.Text.Json;
using ObsidianArchitect.Application.DTOs;
using ObsidianArchitect.Domain.Exceptions;

namespace ObsidianArchitect.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, error) = exception switch
        {
            BusinessRuleException e => (HttpStatusCode.BadRequest, new ApiError(e.Code, e.Message)),
            NotFoundException e => (HttpStatusCode.NotFound, new ApiError("NOT_FOUND", e.Message)),
            ForbiddenException e => (HttpStatusCode.Forbidden, new ApiError("FORBIDDEN", e.Message)),
            FluentValidation.ValidationException e => (HttpStatusCode.BadRequest, 
                new ApiError("VALIDATION_ERROR", "Validation failed", e.Errors.Select(x => new { x.PropertyName, x.ErrorMessage }))),
            _ => (HttpStatusCode.InternalServerError, new ApiError("SERVER_ERROR", $"[{exception.GetType().Name}] {exception.Message}{(exception.InnerException != null ? " --> " + exception.InnerException.Message : "")}"))
        };

        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(error, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
