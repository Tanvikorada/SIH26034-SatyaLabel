import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

old_catch = '''    } catch (err) {
      const is503 = err.message && (err.message.includes('503') || err.message.includes('overloaded') || err.message.includes('high demand'));
      if ((err.code === 'GEMINI_TIMEOUT' || is503) && attempt < 3) {
        const nextModel = modelName === 'gemini-1.5-flash-latest' ? 'gemini-1.5-pro-latest' : 'gemini-1.0-pro-vision-latest';
        console.warn([OCR] Gemini  - retrying with ...);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, nextModel);
      }
      throw err;
    }'''

new_catch = '''    } catch (err) {
      if (attempt < 3) {
        // Fallback chain: 1.5-flash -> 1.5-pro -> 1.0-pro-vision (or just pro-vision)
        const nextModel = modelName === 'gemini-1.5-flash-latest' 
            ? 'gemini-1.5-pro-latest' 
            : (modelName === 'gemini-1.5-pro-latest' ? 'gemini-pro-vision' : 'gemini-1.0-pro-vision-latest');
        
        console.warn([OCR] Gemini failed with  () - retrying with ...);
        await new Promise(r => setTimeout(r, 1000)); // sleep before retry
        return runGeminiVision(imagePath, attempt + 1, nextModel);
      }
      throw err;
    }'''

ocr = ocr.replace(old_catch, new_catch)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)

# Now fix rules_engine.js
with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    rules = f.read()

old_rules_catch = '''        } catch (err) {
            console.warn([RulesEngine] Model  failed: );
            errToThrow = err;
            if (!err.message.includes('503') && !err.message.includes('429') && !err.message.includes('overloaded') && !err.message.includes('high demand')) {
                break; // Don't retry if it's a structural error
            }
            await new Promise(r => setTimeout(r, 1500)); // sleep before retry
        }'''

new_rules_catch = '''        } catch (err) {
            console.warn([RulesEngine] Model  failed: );
            errToThrow = err;
            await new Promise(r => setTimeout(r, 1000)); // sleep before retry - ALWAYS retry the next model to handle 404s/403s on specific models
        }'''

# also fix modelsToTry array to ensure gemini-pro is included for text
rules = rules.replace("['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.0-pro-vision-latest']", "['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro']")

rules = rules.replace(old_rules_catch, new_rules_catch)

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(rules)

print("Done fixing retries.")
